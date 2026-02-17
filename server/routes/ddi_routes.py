from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional, Dict, Any
from services.ddi_service import ddi_service
from db.config import get_supabase_client
from pydantic import BaseModel

router = APIRouter(tags=["DDI"])

class InteractionRequest(BaseModel):
    drug_ids: List[str]
    user_id: Optional[str] = None
    patient_context: Optional[Dict[str, Any]] = None
    mode: str = "patient"

class ExplanationRequest(BaseModel):
    drug_a: str
    drug_b: str
    severity: str
    mode: str = "patient"

@router.get("/search")
async def search_drugs(q: str = Query(..., min_length=2)):
    """Search for drugs by name for the autocomplete input."""
    supabase = get_supabase_client()
    res = supabase.table("drugs").select("id, name").ilike("name", f"%{q}%").limit(10).execute()
    return res.data

@router.post("/check")
async def check_interactions(request: InteractionRequest):
    """Check for interactions between a list of drug IDs."""
    try:
        interactions = await ddi_service.check_interactions(request.drug_ids)
        
        # Use provided context or fetch from DB if only user_id is provided
        patient_context = request.patient_context
        if not patient_context and request.user_id:
            supabase = get_supabase_client()
            profile_res = supabase.table("patient_profiles").select("*").eq("user_id", request.user_id).execute()
            if profile_res.data:
                patient_context = profile_res.data[0]
        
        summary = await ddi_service.get_risk_summary(interactions, patient_context)
        return {
            "interactions": interactions,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/explain")
async def explain_interaction(request: ExplanationRequest):
    """Generate an AI explanation for a specific interaction."""
    try:
        explanation = await ddi_service.get_ai_explanation(
            {
                "drug_a": request.drug_a,
                "drug_b": request.drug_b,
                "severity": request.severity
            },
            mode=request.mode
        )
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/drugs")
async def get_all_drugs(limit: int = 50):
    """Get a list of drugs (useful for initial loading or debugging)."""
    supabase = get_supabase_client()
    res = supabase.table("drugs").select("*").limit(limit).execute()
    return res.data

@router.get("/stats")
async def get_ddi_stats():
    """Get aggregate stats for the dashboard."""
    try:
        supabase = get_supabase_client()
        
        # Get drug count
        drugs_res = supabase.table("drugs").select("id", count="exact").execute()
        drug_count = drugs_res.count if drugs_res.count is not None else 0
        
        # Get interaction count
        inter_res = supabase.table("interactions").select("id", count="exact").execute()
        inter_count = inter_res.count if inter_res.count is not None else 0
        
        return {
            "drug_count": drug_count,
            "interaction_count": inter_count,
            "system_status": "active"
        }
    except Exception as e:
        return {
            "drug_count": 0,
            "interaction_count": 0,
            "system_status": "degraded",
            "error": str(e)
        }
