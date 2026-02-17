import logging
import itertools
from typing import List, Dict, Any
from db.config import get_supabase_client
from utils.llm_utils import get_llm
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage

logger = logging.getLogger(__name__)

class DDIService:
    def __init__(self):
        self.supabase = get_supabase_client()
        self.llm = get_llm(temperature=0.3)

    async def check_interactions(self, drug_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Check for pairwise interactions between a list of drug IDs.
        """
        if len(drug_ids) < 2:
            return []

        # Create all unique pairs
        pairs = list(itertools.combinations(drug_ids, 2))
        
        results = []
        for drug_a, drug_b in pairs:
            # Query interactions table (check both directions just in case, though schema should handle order)
            # In DDInter, interactions are usually stored A -> B.
            res = self.supabase.table("interactions")\
                .select("severity, drugs_a:drug_a_id(name), drugs_b:drug_b_id(name)")\
                .or_(f"and(drug_a_id.eq.{drug_a},drug_b_id.eq.{drug_b}),and(drug_a_id.eq.{drug_b},drug_b_id.eq.{drug_a})")\
                .execute()
            
            if res.data:
                interaction = res.data[0]
                results.append({
                    "drug_a": interaction["drugs_a"]["name"],
                    "drug_b": interaction["drugs_b"]["name"],
                    "severity": interaction["severity"],
                    "drug_a_id": drug_a,
                    "drug_b_id": drug_b
                })
        
        return results

    async def get_ai_explanation(self, interaction: Dict[str, Any], mode: str = "patient") -> str:
        """
        Generate an AI explanation for a specific interaction.
        mode: 'patient' or 'clinician'
        """
        drug_a = interaction["drug_a"]
        drug_b = interaction["drug_b"]
        severity = interaction["severity"]

        system_prompt = (
            "You are a clinical pharmacology AI assistant. "
            "Your task is to explain the interaction between two drugs based on their severity level. "
            f"Mode: {mode.upper()}. "
            "If Mode is PATIENT: Use simple, non-medical language, focus on safety and what to do (e.g., 'Consult your doctor'). "
            "If Mode is CLINICIAN: Use professional medical terminology, focus on mechanism of action and clinical management."
        )

        user_prompt = (
            f"Explain the interaction between {drug_a} and {drug_b}. "
            f"The severity level is {severity}. "
            "Keep the response concise and grounded in clinical safety."
        )

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]

        try:
            response = await self.llm.ainvoke(messages)
            return response.content
        except Exception as e:
            logger.error(f"Error generating AI explanation: {e}")
            return "Unable to generate explanation at this time. Please consult a healthcare professional."

    async def get_risk_summary(self, interactions: List[Dict[str, Any]], patient_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate a detailed risk breakdown based on interactions and patient profile.
        """
        # 1. Base Drug Interaction Risk
        score_map = {"Major": 10, "Moderate": 5, "Minor": 2, "Unknown": 1}
        drug_risk = sum(score_map.get(i["severity"], 1) for i in interactions) if interactions else 0
        
        # 2. Patient Profile Risks (Analytical)
        age_risk = 0
        kidney_risk = 0
        alcohol_risk = 0
        
        if patient_context:
            # Age Risk (+1 if > 65)
            age = patient_context.get("age", 0)
            if age > 65:
                age_risk = 1
            
            # Kidney Risk (+1 if CKD or similar conditions)
            conditions = [c.lower() for c in patient_context.get("conditions", [])]
            if any(k in conditions for k in ["ckd", "kidney", "renal", "nephro"]):
                kidney_risk = 1
            
            # Alcohol Risk (+1 if lifestyle includes alcohol)
            lifestyle = patient_context.get("lifestyle", {})
            if lifestyle.get("alcohol") in ["moderate", "heavy"]:
                alcohol_risk = 1

        total_score = drug_risk + age_risk + kidney_risk + alcohol_risk
        norm_score = min(total_score * 10, 100) # Balanced multiplier

        # Generate summary
        drug_names = list(set([i["drug_a"] for i in interactions] + [i["drug_b"] for i in interactions]))
        if not drug_names:
            summary = "Add at least two medications to generate a safety assessment."
        else:
            prompt = (
                f"Medications: {', '.join(drug_names)}. "
                f"Interactions: {len(interactions)}. "
                f"Patient: Age {patient_context.get('age') if patient_context else 'N/A'}. "
                "Provide a one-sentence clinical safety summary."
            )
            try:
                res = await self.llm.ainvoke(prompt)
                summary = res.content
            except:
                summary = "Multiple clinical risk factors detected. Careful monitoring required."

        return {
            "score": norm_score,
            "summary": summary,
            "interaction_count": len(interactions),
            "breakdown": {
                "drug_interaction_risk": drug_risk,
                "age_risk": age_risk,
                "kidney_risk": kidney_risk,
                "alcohol_risk": alcohol_risk,
                "total": total_score
            }
        }

# Singleton instance
ddi_service = DDIService()
