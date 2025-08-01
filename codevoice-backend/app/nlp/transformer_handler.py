from transformers import pipeline

# Load sentiment analysis model
sentiment_pipeline = pipeline("sentiment-analysis")

def extract_transformer_sentiment(text):
    result = sentiment_pipeline(text)
    return result[0]  # returns {'label': 'POSITIVE', 'score': 0.99}
