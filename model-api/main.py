import json
from flask import Flask, jsonify
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import one_hot
import numpy as np
import pandas as pd
import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem.snowball import SnowballStemmer
from tensorflow.keras.models import load_model

nltk.download('stopwords')

app = Flask(__name__)

model = load_model('job-fake.h5')

def preprocess_text(text):
    stop_words = set(stopwords.words('english'))
    punctuations = set(string.punctuation)
    stop_words.update(punctuations)
    lemmatizer = SnowballStemmer(language='english')
    
    clean_text = re.sub('[^a-zA-Z]', ' ', text)
    clean_text = clean_text.lower().split()
    clean_text = [lemmatizer.stem(word) for word in clean_text if word not in stop_words]
    clean_text = ' '.join(clean_text)
    
    return clean_text

@app.route('/')
def index():
    return 'Hello!'

import requests

@app.route('/predict_job/<descriptionId>', methods=['GET'])
def predict_job(descriptionId):
    try:
        url = f'https://us-central1-jobguardian-app-project.cloudfunctions.net/app/api/getDescription/{descriptionId}'
        response = requests.get(url)
        
        if response.status_code == 200:
            job_description = response.json().get('job_description', '')
            
            cleaned_text = preprocess_text(job_description)

            voc_size = 5000
            onehot_text = [one_hot(cleaned_text, voc_size)]
            sent_length = 100
            sent_with_same_length = pad_sequences(onehot_text, padding='post', maxlen=sent_length)

            prediction = model.predict(sent_with_same_length)

            if prediction[0][0] == 1:
                result = "Fake Job Offer"
            else:
                result = "Genuine Job Offer"

            # Update statusVerified di API mobile
            update_url = f'https://us-central1-jobguardian-app-project.cloudfunctions.net/app/api/updateStatusJobDescription/{descriptionId}'
            update_data = {'statusVerified': result}  # Menggunakan hasil prediksi
            update_response = requests.put(update_url, json=update_data)

            if update_response.status_code == 200:
                return jsonify({'prediction': result, 'update_status': 'Success'})
            else:
                return jsonify({'prediction': result, 'update_status': 'Failed to update'}), 500

        else:
            return jsonify({'error': 'Failed to fetch job description from the API.'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not Found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
