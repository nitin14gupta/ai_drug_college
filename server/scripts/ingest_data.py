import pandas as pd
import os
import sys
from pathlib import Path

# Add server directory to path to import db config
sys.path.append(str(Path(__file__).parent.parent))

from db.config import get_supabase_client

def ingest_ddi_data():
    supabase = get_supabase_client()
    data_dir = Path(__file__).parent.parent / "data"
    
    csv_files = [
        "ddinter_downloads_code_A.csv",
        "ddinter_downloads_code_B.csv",
        "ddinter_downloads_code_R.csv"
    ]
    
    drug_map = {} # id -> name
    all_interactions = []
    
    print("Reading CSV files...")
    for file_name in csv_files:
        file_path = data_dir / file_name
        if not file_path.exists():
            print(f"Skipping {file_name}, file not found.")
            continue
            
        print(f"Processing {file_name}...")
        df = pd.read_csv(file_path)
        
        # Collect unique drugs
        for _, row in df.iterrows():
            drug_map[row['DDInterID_A']] = row['Drug_A']
            drug_map[row['DDInterID_B']] = row['Drug_B']
            
            # Prepare interactions
            all_interactions.append({
                "drug_a_id": row['DDInterID_A'],
                "drug_b_id": row['DDInterID_B'],
                "severity": row['Level']
            })
    
    # Ingest Drugs
    drug_data = [{"id": id, "name": name} for id, name in drug_map.items()]
    print(f"Upserting {len(drug_data)} unique drugs...")
    
    batch_size = 200
    for i in range(0, len(drug_data), batch_size):
        batch = drug_data[i:i+batch_size]
        try:
            supabase.table("drugs").upsert(batch, on_conflict="id").execute()
            print(f"Ingested {min(i+batch_size, len(drug_data))} drugs...")
        except Exception as e:
            print(f"Error in drug batch {i}: {str(e)}")

    # Ingest Interactions
    # Deduplicate interactions based on drug_a_id and drug_b_id
    unique_interactions = {}
    for inter in all_interactions:
        key = tuple(sorted([inter['drug_a_id'], inter['drug_b_id']]))
        unique_interactions[key] = inter
    
    interaction_data = list(unique_interactions.values())
    print(f"Upserting {len(interaction_data)} unique interactions...")
    
    for i in range(0, len(interaction_data), batch_size):
        batch = interaction_data[i:i+batch_size]
        try:
            supabase.table("interactions").upsert(batch, on_conflict="drug_a_id,drug_b_id").execute()
            print(f"Ingested {min(i+batch_size, len(interaction_data))} interactions...")
        except Exception as e:
            print(f"Error in interaction batch {i}: {str(e)}")

    print("Ingestion complete!")

if __name__ == "__main__":
    ingest_ddi_data()
