from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from db.config import get_supabase_client
from pydantic import BaseModel

router = APIRouter(tags=["User Medications"])

class MedicationEntry(BaseModel):
    user_id: str
    drug_id: str
    drug_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None

@router.get("/medications/{user_id}")
async def get_user_medications(user_id: str):
    """Get all saved medications for a specific user."""
    supabase = get_supabase_client()
    res = supabase.table("user_medications").select("*").eq("user_id", user_id).execute()
    return res.data

@router.post("/medications")
async def add_user_medication(entry: MedicationEntry):
    """Add a medication to the user's permanent list."""
    supabase = get_supabase_client()
    res = supabase.table("user_medications").insert({
        "user_id": entry.user_id,
        "drug_id": entry.drug_id,
        "drug_name": entry.drug_name,
        "dosage": entry.dosage,
        "frequency": entry.frequency
    }).execute()
    
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to add medication")
    return res.data[0]

@router.delete("/medications/{med_id}")
async def delete_user_medication(med_id: int):
    """Remove a medication from the user's list."""
    supabase = get_supabase_client()
    res = supabase.table("user_medications").delete().eq("id", med_id).execute()
    return {"status": "deleted"}
