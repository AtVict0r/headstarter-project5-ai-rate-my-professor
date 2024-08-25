from dotenv import load_dotenv
load_dotenv()
from pinecone import Pinecone, ServerlessSpec
import os, json, google.generativeai as genai

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
pc_index = os.getenv("PINECONE_INDEX_NAME")

# Create a Pinecone index
if pc_index not in pc.list_indexes().names():
    pc.create_index(
        name=pc_index,
        dimension=768,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )

# Load the review data
data = json.load(open("reviews.json"))
processed_data = []

# Initialize the Google Generative AI API
genai.configure(api_key=os.getenv("GOOGLE_AI_API_KEY"))

# Create embeddings for each review
for review in data["reviews"]:
    embedding = genai.embed_content(
        model="models/text-embedding-004",
        content={
            "parts": [
                {
                    "text": review["review"]
                }
            ]
        },
        task_type="retrieval_document",
        title = "Custom query"
    )["embedding"]
    processed_data.append(
        {
            "values": embedding,
            "id": review["professor"],
            "metadata":{
                "review": review["review"],
                "subject": review["subject"],
                "stars": review["stars"],
            }
        }
    )

# Insert the embeddings into the Pinecone index
index = pc.Index(pc_index)
upsert_response = index.upsert(
    vectors=processed_data,
    namespace="ns1",
)
print(f"Upserted count: {upsert_response['upserted_count']}")

# Print index statistics
print(index.describe_index_stats())