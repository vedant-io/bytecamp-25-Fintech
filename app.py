import os
import re
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain import OpenAI
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import UnstructuredURLLoader
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS

# Set OpenAI API Key
openai_key = "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"
os.environ["OPENAI_API_KEY"] = openai_key

# Load pre-trained model
model = joblib.load("ngo_impact_model.pkl")

# Initialize FastAPI app
app = FastAPI()


# Pydantic model for request body
class URLRequest(BaseModel):
    url: str


# def extract_numbers(text):
#     """ Extract numerical values from the paragraph text """
#     goal = re.search(r"total goal amount:.*?(\d[\d,]*)", text)
#     remaining = re.search(r"remaining funds amount:.*?(\d[\d,]*)", text)
#     donors = re.search(r"number of donors:.*?(\d[\d,]*)", text)
#
#     goal = int(goal.group(1).replace(',', '')) if goal else 0
#     remaining = int(remaining.group(1).replace(',', '')) if remaining else 0
#     donors = int(donors.group(1).replace(',', '')) if donors else 0
#
#     return goal, remaining, donors

import spacy

nlp = spacy.load("en_core_web_sm")
def extract_numbers(text):
    """ Extract numerical values from flexible text formats """
    doc = nlp(text)

    goal = remaining = donors = 0
    for ent in doc.ents:
        if ent.label_ == "MONEY":  # Look for monetary values
            if "goal" in text.lower():
                goal = int(ent.text.replace(",", "").replace("$", "").split()[0]) * (1_000_000 if "million" in ent.text else 1)
            elif "remaining" in text.lower():
                remaining = int(ent.text.replace(",", "").replace("$", "").split()[0])
        elif ent.label_ == "CARDINAL":  # Look for numeric values
            if "donors" in text.lower():
                donors = int(ent.text.replace(",", ""))

    return goal, remaining, donors



@app.post("/predict")
def predict_impact(data: URLRequest):
    try:
        # Load data from URL
        loaders = UnstructuredURLLoader(urls=[data.url])
        documents = loaders.load()

        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=30)
        docs = text_splitter.split_documents(documents)

        # Create embeddings and FAISS index
        embeddings = OpenAIEmbeddings()
        vectorindex_openai = FAISS.from_documents(docs, embeddings)

        # Create QA retrieval chain
        llm = OpenAI(temperature=0.9, max_tokens=500)
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=vectorindex_openai.as_retriever())

        query = "impact, total goal amount, remaining funds amount, number of donors"
        op = chain({"query": query}, return_only_outputs=True)
        result = op['result']

        # Extract numerical values
        goal, remaining, donors = extract_numbers(result)

        # Create DataFrame for prediction
        new_df = pd.DataFrame({
            "description": [result],
            "total_goal": [goal],
            "remaining_funds": [remaining],
            "donors": [donors]
        })


        # Predict impact score
        predicted_score = model.predict(new_df)[0]

        return {
            "predicted_impact_score": round(predicted_score, 2),
            "description": result,
            "total_goal": goal,
            "remaining_funds": remaining,
            "donors": donors
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app,host= "127.0.0.1",port = 8000)