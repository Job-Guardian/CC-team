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

app = Flask(__name__)
api = Api(app)

model = load_model('model-api/job-fake.h5')  # Jika model berada dalam subfolder 'flask-api'

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

class PredictJobFraud(Resource):
    def post(self):
        try:
            # Ambil data yang dikirimkan oleh API mobile
            data = request.get_json(force=True)
            job_description = data['job_description']
            
            # Lakukan preprocessing pada teks yang diterima
            cleaned_text = preprocess_text(job_description)
            
            # Lakukan one-hot encoding pada teks yang sudah dipreprocess
            voc_size = 5000
            onehot_text = [one_hot(cleaned_text, voc_size)]
            sent_length = 100
            sent_with_same_length = pad_sequences(onehot_text, padding='post', maxlen=sent_length)
            
            # Lakukan prediksi menggunakan model
            prediction = model.predict(sent_with_same_length)
            
            # Konversi hasil prediksi menjadi label
            if prediction[0][0] == 1:
                result = "False Job Offer"
            else:
                result = "Genuine Job Offer"
            
            # Mengembalikan hasil prediksi
            return {'prediction': result}

        except Exception as e:
            return {'error': str(e)}
    
api.add_resource(PredictJobFraud, '/predict')

if __name__ == '__main__':
    app.run(debug=True)
