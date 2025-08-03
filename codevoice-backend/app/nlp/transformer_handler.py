from transformers import pipeline

def extract_transformer_sentiment(text):
    sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english", device=-1)
    result = sentiment_pipeline(text)
    return result[0]
