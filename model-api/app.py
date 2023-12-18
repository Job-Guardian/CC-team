import json
from flask import Flask, jsonify, request,make_response
from flask_restful import Resource, Api
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import one_hot
import numpy as np
import pandas as pd
import re
import string
from nltk.corpus import stopwords
from nltk.stem.snowball import SnowballStemmer
from tensorflow.keras.models import load_model

nltk.download('stopwords')

app = Flask(__name__)
api = Api(app)

model = load_model('job-fake.h5')  # Jika model berada dalam subfolder 'flask-api'

# Function to preprocess input text
def preprocess_text(text):
    stop_words = set(stopwords.words('english'))
    punctuations = set(string.punctuation)
    stop_words.update(punctuations)
    lemmatizer = SnowballStemmer(language='english')
    
    clean_text = re.sub('[^a-zA-Z]', ' ', text)
    clean_text = clean_text.lower().split()
    clean_text = [lemmatizer.stem(word) for word in clean_text if not word in stop_words]
    clean_text = ' '.join(clean_text)
    
    return clean_text

@app.route('/')
def index():
    return 'Hello!'

@app.route('/predict_job', methods=['POST'])
def predict_job():
    try:
        data = request.get_json(force=True)
        job_description = data.get('job_description', '')
        
        cleaned_text = preprocess_text(job_description)
        
        voc_size = 5000
        onehot_text = [one_hot(cleaned_text, voc_size)]
        sent_length = 100
        sent_with_same_length = pad_sequences(onehot_text, padding='post', maxlen=sent_length)
        
        prediction = model.predict(sent_with_same_length)
        
        if prediction[0][0] == 1:
            result = "False Job Offer"
        else:
            result = "Genuine Job Offer"
        
        return jsonify({'prediction': result})

    except Exception as e:
        return jsonify({'error': str(e)}), 400
        
if __name__ == '__main__':
    app.run(debug=True)
