# 🤖 AI Chatbot Implementation Guide
## Customer Support Chatbot dengan TensorFlow & Go Backend

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Dataset Preparation](#dataset-preparation)
5. [Backend Implementation](#backend-implementation)
6. [AI Model Implementation](#ai-model-implementation)
7. [Frontend Implementation](#frontend-implementation)
8. [Training & Deployment](#training--deployment)

---

## 🎯 Overview

### Goals
- Membuat chatbot yang dapat menjawab pertanyaan customer
- Model AI yang mudah di-training dengan dataset kecil
- Integrasi seamless dengan React frontend dan Go backend
- Real-time response dengan latency rendah

### Features
- ✅ Intent Classification (memahami maksud pertanyaan)
- ✅ Entity Recognition (ekstrak informasi penting)
- ✅ Predefined Responses (jawaban otomatis)
- ✅ Fallback to Human (jika tidak bisa menjawab)
- ✅ Chat History
- ✅ Admin Dashboard untuk manage responses

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ChatBot Widget                                       │  │
│  │  - Input Message                                      │  │
│  │  - Chat History                                       │  │
│  │  - Quick Replies                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ WebSocket / REST API
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Go Server)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Chat Handler                                         │  │
│  │  - Receive Message                                    │  │
│  │  - Call Python ML Service                            │  │
│  │  - Get Response from DB                              │  │
│  │  - Send Response                                      │  │
│  └──────────────────────┬───────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────┘
                          │ HTTP/gRPC
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              PYTHON ML SERVICE (FastAPI)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TensorFlow Model                                     │  │
│  │  - Intent Classification                             │  │
│  │  - Named Entity Recognition (NER)                    │  │
│  │  - Confidence Score                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  - chat_conversations                                        │
│  - chat_messages                                             │
│  - chatbot_intents                                           │
│  - chatbot_responses                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
- **Go (Gin)**: Main API server
- **Python (FastAPI)**: ML model service
- **PostgreSQL**: Database
- **Redis**: Caching & session management

### AI/ML
- **TensorFlow/Keras**: Deep learning framework
- **Transformers (Hugging Face)**: Pre-trained models
- **spaCy**: NLP preprocessing
- **NLTK**: Text processing

### Frontend
- **React**: UI
- **Socket.io / WebSocket**: Real-time chat
- **TailwindCSS**: Styling

### Alternative (Simpler)
- **DialogFlow**: Google's chatbot platform (No ML coding needed)
- **Rasa**: Open-source chatbot framework
- **Botpress**: Visual chatbot builder

---

## 📊 Database Schema

```sql
-- Chat Conversations
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active', -- active, closed, escalated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

-- Chat Messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id),
    sender VARCHAR(50) NOT NULL, -- 'user' or 'bot'
    message TEXT NOT NULL,
    intent VARCHAR(100), -- classified intent
    confidence FLOAT, -- confidence score
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chatbot Intents (Training Data)
CREATE TABLE chatbot_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intent_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    training_phrases TEXT[], -- Array of example questions
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chatbot Responses
CREATE TABLE chatbot_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intent_name VARCHAR(100) REFERENCES chatbot_intents(intent_name),
    response_text TEXT NOT NULL,
    response_type VARCHAR(50) DEFAULT 'text', -- text, card, quick_reply
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional data (buttons, links, etc)
    priority INT DEFAULT 0, -- For multiple responses
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX idx_conversations_session ON chat_conversations(session_id);
CREATE INDEX idx_intents_active ON chatbot_intents(is_active);
```

### Sample Data

```sql
-- Insert sample intents
INSERT INTO chatbot_intents (intent_name, description, training_phrases) VALUES
('greeting', 'User greets the bot', ARRAY[
    'hello',
    'hi',
    'hey',
    'good morning',
    'good afternoon',
    'hai',
    'halo'
]),
('services', 'Ask about services', ARRAY[
    'what services do you offer',
    'what can you do',
    'tell me about your services',
    'apa layanan yang tersedia',
    'layanan apa saja'
]),
('pricing', 'Ask about pricing', ARRAY[
    'how much does it cost',
    'what is the price',
    'pricing information',
    'berapa harganya',
    'harga berapa'
]),
('contact', 'Want to contact', ARRAY[
    'how can i contact you',
    'contact information',
    'email address',
    'bagaimana cara menghubungi',
    'kontak'
]),
('portfolio', 'Ask about portfolio', ARRAY[
    'show me your work',
    'portfolio',
    'projects',
    'past work',
    'tampilkan portfolio',
    'contoh project'
]);

-- Insert sample responses
INSERT INTO chatbot_responses (intent_name, response_text, response_type, metadata) VALUES
('greeting', 'Hello! 👋 I''m here to help you. How can I assist you today?', 'text', '{}'),
('greeting', 'Hi there! Welcome to my portfolio. What would you like to know?', 'text', '{}'),
('services', 'I offer Full Stack Development services including:\n• React & TypeScript Frontend\n• Go Backend Development\n• Mobile App Development (React Native)\n• Database Design & Optimization\n\nWhich one interests you?', 'text', '{"quick_replies": ["Frontend", "Backend", "Mobile", "Database"]}'),
('pricing', 'Pricing varies based on project complexity and requirements. I offer:\n• Hourly Rate: $50-100/hr\n• Fixed Price Projects\n• Monthly Retainer\n\nWould you like to discuss your project?', 'text', '{"cta": {"text": "Schedule a Call", "link": "/contact"}}'),
('contact', 'You can reach me at:\n📧 Email: asep@example.com\n💼 LinkedIn: linkedin.com/in/asepjumadi\n🐙 GitHub: github.com/asepjumadi\n\nOr fill out the contact form, and I''ll get back to you within 24 hours!', 'text', '{"cta": {"text": "Contact Form", "link": "/contact"}}'),
('portfolio', 'I''ve worked on various projects. Check out my portfolio page to see:\n• E-commerce platforms\n• SaaS applications\n• Mobile apps\n• API development\n\nClick below to explore!', 'text', '{"cta": {"text": "View Portfolio", "link": "/projects"}}');
```

---

## 🤖 AI Model Implementation

### Approach 1: Simple Intent Classification (Recommended untuk Start)

Menggunakan **TF-IDF + Logistic Regression** atau **BERT-based model**

#### File Structure
```
ml-service/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app
│   ├── models/
│   │   ├── __init__.py
│   │   ├── intent_classifier.py
│   │   └── ner_model.py
│   ├── training/
│   │   ├── train_intent.py
│   │   └── prepare_data.py
│   └── utils/
│       ├── preprocessing.py
│       └── database.py
├── models/               # Saved model files
├── data/
│   ├── intents.json
│   └── training_data.csv
├── requirements.txt
└── Dockerfile
```

#### 1. Requirements

```txt
# ml-service/requirements.txt
fastapi==0.104.1
uvicorn==0.24.0
tensorflow==2.15.0
transformers==4.35.0
scikit-learn==1.3.2
pandas==2.1.3
numpy==1.26.2
spacy==3.7.2
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pydantic==2.5.0
```

#### 2. Intent Classifier Model

```python
# ml-service/app/models/intent_classifier.py

import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle
import json
from typing import List, Tuple

class IntentClassifier:
    def __init__(self, model_path: str = None):
        self.model = None
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),
            lowercase=True
        )
        self.label_encoder = LabelEncoder()
        self.intents = []
        
        if model_path:
            self.load_model(model_path)
    
    def prepare_data(self, training_data: List[dict]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Training data format:
        [
            {"text": "hello", "intent": "greeting"},
            {"text": "hi there", "intent": "greeting"},
            ...
        ]
        """
        texts = [item['text'].lower() for item in training_data]
        intents = [item['intent'] for item in training_data]
        
        # Encode labels
        y = self.label_encoder.fit_transform(intents)
        self.intents = list(self.label_encoder.classes_)
        
        # Vectorize texts
        X = self.vectorizer.fit_transform(texts).toarray()
        
        return X, y
    
    def build_model(self, input_dim: int, num_classes: int):
        """Build a simple neural network"""
        model = keras.Sequential([
            keras.layers.Dense(128, activation='relu', input_dim=input_dim),
            keras.layers.Dropout(0.5),
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(num_classes, activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.model = model
        return model
    
    def train(self, training_data: List[dict], epochs: int = 50, validation_split: float = 0.2):
        """Train the model"""
        X, y = self.prepare_data(training_data)
        
        if self.model is None:
            self.build_model(X.shape[1], len(self.intents))
        
        history = self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=8,
            validation_split=validation_split,
            verbose=1
        )
        
        return history
    
    def predict(self, text: str) -> Tuple[str, float]:
        """Predict intent and confidence"""
        if self.model is None:
            raise ValueError("Model not trained or loaded")
        
        # Preprocess
        text_vec = self.vectorizer.transform([text.lower()]).toarray()
        
        # Predict
        predictions = self.model.predict(text_vec, verbose=0)[0]
        
        # Get top prediction
        top_idx = np.argmax(predictions)
        confidence = float(predictions[top_idx])
        intent = self.intents[top_idx]
        
        return intent, confidence
    
    def predict_top_k(self, text: str, k: int = 3) -> List[Tuple[str, float]]:
        """Get top K predictions"""
        text_vec = self.vectorizer.transform([text.lower()]).toarray()
        predictions = self.model.predict(text_vec, verbose=0)[0]
        
        # Get top K
        top_indices = np.argsort(predictions)[-k:][::-1]
        results = [
            (self.intents[idx], float(predictions[idx]))
            for idx in top_indices
        ]
        
        return results
    
    def save_model(self, path: str):
        """Save model and preprocessing objects"""
        self.model.save(f"{path}/model.h5")
        
        with open(f"{path}/vectorizer.pkl", 'wb') as f:
            pickle.dump(self.vectorizer, f)
        
        with open(f"{path}/label_encoder.pkl", 'wb') as f:
            pickle.dump(self.label_encoder, f)
        
        with open(f"{path}/intents.json", 'w') as f:
            json.dump(self.intents, f)
    
    def load_model(self, path: str):
        """Load saved model"""
        self.model = keras.models.load_model(f"{path}/model.h5")
        
        with open(f"{path}/vectorizer.pkl", 'rb') as f:
            self.vectorizer = pickle.load(f)
        
        with open(f"{path}/label_encoder.pkl", 'rb') as f:
            self.label_encoder = pickle.load(f)
        
        with open(f"{path}/intents.json", 'r') as f:
            self.intents = json.load(f)
```

#### 3. Training Script

```python
# ml-service/app/training/train_intent.py

import psycopg2
import os
from dotenv import load_dotenv
from app.models.intent_classifier import IntentClassifier

load_dotenv()

def fetch_training_data():
    """Fetch training data from PostgreSQL"""
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT intent_name, training_phrases 
        FROM chatbot_intents 
        WHERE is_active = true
    """)
    
    training_data = []
    for row in cursor.fetchall():
        intent_name = row[0]
        phrases = row[1]  # Array of phrases
        
        for phrase in phrases:
            training_data.append({
                'text': phrase,
                'intent': intent_name
            })
    
    cursor.close()
    conn.close()
    
    return training_data

def main():
    print("Fetching training data...")
    training_data = fetch_training_data()
    
    print(f"Found {len(training_data)} training examples")
    
    print("Training model...")
    classifier = IntentClassifier()
    history = classifier.train(training_data, epochs=100)
    
    print("Saving model...")
    classifier.save_model('./models/intent_classifier')
    
    print("Done!")
    
    # Test predictions
    test_texts = [
        "hello there",
        "what do you do",
        "how much does it cost",
        "show me your projects"
    ]
    
    print("\nTest predictions:")
    for text in test_texts:
        intent, confidence = classifier.predict(text)
        print(f"Text: {text}")
        print(f"Intent: {intent} (confidence: {confidence:.2f})\n")

if __name__ == "__main__":
    main()
```

#### 4. FastAPI Service

```python
# ml-service/app/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from app.models.intent_classifier import IntentClassifier

app = FastAPI(title="ML Service API", version="1.0.0")

# Load model on startup
MODEL_PATH = os.getenv('MODEL_PATH', './models/intent_classifier')
classifier = IntentClassifier(MODEL_PATH)

class PredictRequest(BaseModel):
    text: str
    top_k: Optional[int] = 1

class PredictResponse(BaseModel):
    intent: str
    confidence: float
    alternatives: Optional[List[dict]] = None

class TrainRequest(BaseModel):
    training_data: List[dict]
    epochs: int = 50

@app.get("/")
def root():
    return {"message": "ML Service API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": classifier.model is not None}

@app.post("/predict", response_model=PredictResponse)
def predict_intent(request: PredictRequest):
    """Predict intent from user message"""
    try:
        if request.top_k > 1:
            predictions = classifier.predict_top_k(request.text, request.top_k)
            return PredictResponse(
                intent=predictions[0][0],
                confidence=predictions[0][1],
                alternatives=[
                    {"intent": intent, "confidence": conf}
                    for intent, conf in predictions[1:]
                ]
            )
        else:
            intent, confidence = classifier.predict(request.text)
            return PredictResponse(
                intent=intent,
                confidence=confidence
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
def train_model(request: TrainRequest):
    """Train/retrain the model"""
    try:
        history = classifier.train(request.training_data, epochs=request.epochs)
        classifier.save_model(MODEL_PATH)
        
        return {
            "message": "Model trained successfully",
            "final_accuracy": float(history.history['accuracy'][-1]),
            "final_loss": float(history.history['loss'][-1])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reload")
def reload_model():
    """Reload model from disk"""
    try:
        classifier.load_model(MODEL_PATH)
        return {"message": "Model reloaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run with: uvicorn app.main:app --reload --port 8001
```

---

## 🔧 Backend Implementation (Go)

### 1. Domain Entity

```go
// backend/internal/domain/chatbot.go

package domain

import (
    "context"
    "time"
)

type ChatConversation struct {
    ID        string    `json:"id"`
    UserID    *string   `json:"userId,omitempty"`
    SessionID string    `json:"sessionId"`
    UserName  string    `json:"userName"`
    UserEmail string    `json:"userEmail"`
    Status    string    `json:"status"` // active, closed, escalated
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
    ClosedAt  *time.Time `json:"closedAt,omitempty"`
}

type ChatMessage struct {
    ID             string                 `json:"id"`
    ConversationID string                 `json:"conversationId"`
    Sender         string                 `json:"sender"` // user, bot
    Message        string                 `json:"message"`
    Intent         *string                `json:"intent,omitempty"`
    Confidence     *float64               `json:"confidence,omitempty"`
    Metadata       map[string]interface{} `json:"metadata,omitempty"`
    CreatedAt      time.Time              `json:"createdAt"`
}

type ChatIntent struct {
    ID              string    `json:"id"`
    IntentName      string    `json:"intentName"`
    Description     string    `json:"description"`
    TrainingPhrases []string  `json:"trainingPhrases"`
    IsActive        bool      `json:"isActive"`
    CreatedAt       time.Time `json:"createdAt"`
    UpdatedAt       time.Time `json:"updatedAt"`
}

type ChatResponse struct {
    ID           string                 `json:"id"`
    IntentName   string                 `json:"intentName"`
    ResponseText string                 `json:"responseText"`
    ResponseType string                 `json:"responseType"` // text, card, quick_reply
    Metadata     map[string]interface{} `json:"metadata"`
    Priority     int                    `json:"priority"`
    IsActive     bool                   `json:"isActive"`
}

// ML Service Request/Response
type MLPredictRequest struct {
    Text string `json:"text"`
    TopK int    `json:"top_k,omitempty"`
}

type MLPredictResponse struct {
    Intent      string                   `json:"intent"`
    Confidence  float64                  `json:"confidence"`
    Alternatives []map[string]interface{} `json:"alternatives,omitempty"`
}

// Usecases
type ChatbotUsecase interface {
    StartConversation(ctx context.Context, sessionID, userName, userEmail string) (*ChatConversation, error)
    SendMessage(ctx context.Context, sessionID, message string) (*ChatMessage, error)
    GetConversationHistory(ctx context.Context, sessionID string) ([]ChatMessage, error)
    CloseConversation(ctx context.Context, sessionID string) error
    
    // Admin
    GetAllIntents(ctx context.Context) ([]ChatIntent, error)
    CreateIntent(ctx context.Context, intent *ChatIntent) error
    UpdateIntent(ctx context.Context, intent *ChatIntent) error
    DeleteIntent(ctx context.Context, intentName string) error
    
    GetResponsesByIntent(ctx context.Context, intentName string) ([]ChatResponse, error)
    CreateResponse(ctx context.Context, response *ChatResponse) error
    UpdateResponse(ctx context.Context, response *ChatResponse) error
    DeleteResponse(ctx context.Context, id string) error
    
    // Training
    TriggerRetraining(ctx context.Context) error
}

type ChatbotRepository interface {
    CreateConversation(ctx context.Context, conv *ChatConversation) error
    GetConversationBySession(ctx context.Context, sessionID string) (*ChatConversation, error)
    UpdateConversation(ctx context.Context, conv *ChatConversation) error
    
    CreateMessage(ctx context.Context, msg *ChatMessage) error
    GetMessagesByConversation(ctx context.Context, conversationID string) ([]ChatMessage, error)
    
    GetAllIntents(ctx context.Context) ([]ChatIntent, error)
    GetIntentByName(ctx context.Context, intentName string) (*ChatIntent, error)
    CreateIntent(ctx context.Context, intent *ChatIntent) error
    UpdateIntent(ctx context.Context, intent *ChatIntent) error
    DeleteIntent(ctx context.Context, intentName string) error
    
    GetResponsesByIntent(ctx context.Context, intentName string) ([]ChatResponse, error)
    CreateResponse(ctx context.Context, response *ChatResponse) error
    UpdateResponse(ctx context.Context, response *ChatResponse) error
    DeleteResponse(ctx context.Context, id string) error
}
```

### 2. ML Service Client

```go
// backend/internal/infrastructure/ml/client.go

package ml

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "portfolio/internal/domain"
    "time"
)

type MLServiceClient struct {
    baseURL    string
    httpClient *http.Client
}

func NewMLServiceClient(baseURL string) *MLServiceClient {
    return &MLServiceClient{
        baseURL: baseURL,
        httpClient: &http.Client{
            Timeout: 10 * time.Second,
        },
    }
}

func (c *MLServiceClient) PredictIntent(text string) (*domain.MLPredictResponse, error) {
    reqBody := domain.MLPredictRequest{
        Text: text,
        TopK: 3,
    }
    
    jsonData, err := json.Marshal(reqBody)
    if err != nil {
        return nil, err
    }
    
    resp, err := c.httpClient.Post(
        fmt.Sprintf("%s/predict", c.baseURL),
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        body, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("ML service error: %s", string(body))
    }
    
    var result domain.MLPredictResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }
    
    return &result, nil
}

func (c *MLServiceClient) TriggerRetraining() error {
    resp, err := c.httpClient.Post(
        fmt.Sprintf("%s/reload", c.baseURL),
        "application/json",
        nil,
    )
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("failed to trigger retraining")
    }
    
    return nil
}
```

### 3. Chatbot Usecase

```go
// backend/internal/usecase/chatbot_usecase.go

package usecase

import (
    "context"
    "fmt"
    "math/rand"
    "portfolio/internal/domain"
    "portfolio/internal/infrastructure/ml"
    "time"
)

type chatbotUsecase struct {
    repo      domain.ChatbotRepository
    mlClient  *ml.MLServiceClient
}

func NewChatbotUsecase(repo domain.ChatbotRepository, mlClient *ml.MLServiceClient) domain.ChatbotUsecase {
    return &chatbotUsecase{
        repo:     repo,
        mlClient: mlClient,
    }
}

func (u *chatbotUsecase) StartConversation(ctx context.Context, sessionID, userName, userEmail string) (*domain.ChatConversation, error) {
    // Check if conversation exists
    existing, err := u.repo.GetConversationBySession(ctx, sessionID)
    if err == nil && existing != nil {
        return existing, nil
    }
    
    conv := &domain.ChatConversation{
        SessionID: sessionID,
        UserName:  userName,
        UserEmail: userEmail,
        Status:    "active",
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }
    
    if err := u.repo.CreateConversation(ctx, conv); err != nil {
        return nil, err
    }
    
    return conv, nil
}

func (u *chatbotUsecase) SendMessage(ctx context.Context, sessionID, message string) (*domain.ChatMessage, error) {
    // Get conversation
    conv, err := u.repo.GetConversationBySession(ctx, sessionID)
    if err != nil {
        return nil, err
    }
    
    // Save user message
    userMsg := &domain.ChatMessage{
        ConversationID: conv.ID,
        Sender:         "user",
        Message:        message,
        CreatedAt:      time.Now(),
    }
    
    if err := u.repo.CreateMessage(ctx, userMsg); err != nil {
        return nil, err
    }
    
    // Predict intent using ML service
    prediction, err := u.mlClient.PredictIntent(message)
    if err != nil {
        // Fallback response if ML service fails
        botMsg := &domain.ChatMessage{
            ConversationID: conv.ID,
            Sender:         "bot",
            Message:        "I'm sorry, I'm having trouble understanding. Could you please rephrase?",
            CreatedAt:      time.Now(),
        }
        u.repo.CreateMessage(ctx, botMsg)
        return botMsg, nil
    }
    
    // Get response based on intent
    var responseText string
    var metadata map[string]interface{}
    
    if prediction.Confidence > 0.6 {
        responses, err := u.repo.GetResponsesByIntent(ctx, prediction.Intent)
        if err != nil || len(responses) == 0 {
            responseText = "I understand you're asking about " + prediction.Intent + ", but I don't have a specific answer yet. Would you like to contact the team directly?"
        } else {
            // Pick random response if multiple available
            selected := responses[rand.Intn(len(responses))]
            responseText = selected.ResponseText
            metadata = selected.Metadata
        }
    } else {
        // Low confidence - escalate or provide generic response
        responseText = "I'm not quite sure I understand. Here are some topics I can help with:\n• Services\n• Pricing\n• Portfolio\n• Contact Information\n\nWhat would you like to know?"
    }
    
    // Save bot response
    confidence := prediction.Confidence
    intentName := prediction.Intent
    botMsg := &domain.ChatMessage{
        ConversationID: conv.ID,
        Sender:         "bot",
        Message:        responseText,
        Intent:         &intentName,
        Confidence:     &confidence,
        Metadata:       metadata,
        CreatedAt:      time.Now(),
    }
    
    if err := u.repo.CreateMessage(ctx, botMsg); err != nil {
        return nil, err
    }
    
    return botMsg, nil
}

// ... Implement other methods
```

### 4. HTTP Handler

```go
// backend/internal/delivery/http/chatbot_handler.go

package handler

import (
    "net/http"
    "portfolio/internal/domain"
    
    "github.com/gin-gonic/gin"
)

type ChatbotHandler struct {
    chatbotUC domain.ChatbotUsecase
}

func NewChatbotHandler(chatbotUC domain.ChatbotUsecase) *ChatbotHandler {
    return &ChatbotHandler{chatbotUC: chatbotUC}
}

type StartChatRequest struct {
    SessionID string `json:"sessionId" binding:"required"`
    UserName  string `json:"userName"`
    UserEmail string `json:"userEmail"`
}

type SendMessageRequest struct {
    SessionID string `json:"sessionId" binding:"required"`
    Message   string `json:"message" binding:"required"`
}

func (h *ChatbotHandler) StartChat(c *gin.Context) {
    var req StartChatRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    conv, err := h.chatbotUC.StartConversation(c.Request.Context(), req.SessionID, req.UserName, req.UserEmail)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, conv)
}

func (h *ChatbotHandler) SendMessage(c *gin.Context) {
    var req SendMessageRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    botMsg, err := h.chatbotUC.SendMessage(c.Request.Context(), req.SessionID, req.Message)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, botMsg)
}

func (h *ChatbotHandler) GetHistory(c *gin.Context) {
    sessionID := c.Param("sessionId")
    
    messages, err := h.chatbotUC.GetConversationHistory(c.Request.Context(), sessionID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, messages)
}

// Admin endpoints
func (h *ChatbotHandler) GetAllIntents(c *gin.Context) {
    intents, err := h.chatbotUC.GetAllIntents(c.Request.Context())
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, intents)
}

func (h *ChatbotHandler) CreateIntent(c *gin.Context) {
    var intent domain.ChatIntent
    if err := c.ShouldBindJSON(&intent); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    if err := h.chatbotUC.CreateIntent(c.Request.Context(), &intent); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusCreated, intent)
}

func (h *ChatbotHandler) TriggerRetraining(c *gin.Context) {
    if err := h.chatbotUC.TriggerRetraining(c.Request.Context()); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"message": "Retraining triggered successfully"})
}
```

---

## 💻 Frontend Implementation

### 1. Chatbot Widget Component

```typescript
// frontend/src/components/ChatbotWidget.tsx

import React, { useState, useEffect, useRef } from 'react';
import { chatbotApi, ChatMessage } from '../services/api-service';

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initChat = async () => {
    try {
      await chatbotApi.startConversation(sessionId);
      // Add welcome message
      setMessages([{
        id: '1',
        sender: 'bot',
        message: '👋 Hi! I\'m here to help. What would you like to know?',
        createdAt: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputText,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const botResponse = await chatbotApi.sendMessage(sessionId, inputText);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        message: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-green-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs text-green-100">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-green-600 p-1 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-green-500 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  {msg.metadata?.cta && (
                    <a
                      href={msg.metadata.cta.link}
                      className="mt-2 inline-block text-xs underline"
                    >
                      {msg.metadata.cta.text} →
                    </a>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !inputText.trim()}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
```

### 2. API Service

```typescript
// frontend/src/services/api-service.ts (tambahkan)

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  intent?: string;
  confidence?: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ChatIntent {
  id: string;
  intentName: string;
  description: string;
  trainingPhrases: string[];
  isActive: boolean;
}

export interface ChatResponse {
  id: string;
  intentName: string;
  responseText: string;
  responseType: string;
  metadata: Record<string, any>;
  isActive: boolean;
}

export const chatbotApi = {
  startConversation: async (sessionId: string, userName?: string, userEmail?: string) => {
    const response = await axiosClient.post('/public/chatbot/start', {
      sessionId,
      userName,
      userEmail
    });
    return response.data;
  },

  sendMessage: async (sessionId: string, message: string): Promise<ChatMessage> => {
    const response = await axiosClient.post('/public/chatbot/message', {
      sessionId,
      message
    });
    return response.data;
  },

  getHistory: async (sessionId: string): Promise<ChatMessage[]> => {
    const response = await axiosClient.get(`/public/chatbot/history/${sessionId}`);
    return response.data;
  },

  // Admin endpoints
  getAllIntents: async (): Promise<ChatIntent[]> => {
    const response = await axiosClient.get('/admin/chatbot/intents');
    return response.data;
  },

  createIntent: async (intent: Omit<ChatIntent, 'id'>): Promise<ChatIntent> => {
    const response = await axiosClient.post('/admin/chatbot/intents', intent);
    return response.data;
  },

  updateIntent: async (intentName: string, intent: Partial<ChatIntent>): Promise<void> => {
    await axiosClient.put(`/admin/chatbot/intents/${intentName}`, intent);
  },

  deleteIntent: async (intentName: string): Promise<void> => {
    await axiosClient.delete(`/admin/chatbot/intents/${intentName}`);
  },

  getResponses: async (intentName: string): Promise<ChatResponse[]> => {
    const response = await axiosClient.get(`/admin/chatbot/responses/${intentName}`);
    return response.data;
  },

  createResponse: async (response: Omit<ChatResponse, 'id'>): Promise<ChatResponse> => {
    const res = await axiosClient.post('/admin/chatbot/responses', response);
    return res.data;
  },

  triggerRetraining: async (): Promise<void> => {
    await axiosClient.post('/admin/chatbot/retrain');
  },
};
```

### 3. Add to Main Layout

```typescript
// frontend/src/App.tsx or MainLayout.tsx

import ChatbotWidget from './components/ChatbotWidget';

// Add at the end of your component
<ChatbotWidget />
```

---

## 🚀 Deployment & Training

### Docker Compose

```yaml
# docker-compose.yml (tambahkan)

services:
  # ... existing services ...

  ml-service:
    build:
      context: ./ml-service
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    environment:
      - MODEL_PATH=/app/models/intent_classifier
      - DB_HOST=postgres
      - DB_NAME=portfolio
      - DB_USER=postgres
      - DB_PASSWORD=postgres
    volumes:
      - ./ml-service/models:/app/models
    depends_on:
      - postgres
    command: uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Training Workflow

1. **Prepare Training Data** - Tambah intents & phrases via admin dashboard
2. **Run Training Script** - `python ml-service/app/training/train_intent.py`
3. **Reload Model** - Call `/reload` endpoint atau restart ML service
4. **Test** - Chat dengan bot dan lihat accuracy
5. **Iterate** - Tambah lebih banyak training phrases untuk improve

---

## 📊 Monitoring & Improvement

### Metrics to Track
- Intent prediction accuracy
- Confidence scores
- Fallback rate (low confidence responses)
- User satisfaction
- Common unhandled questions

### Continuous Improvement
1. Log semua conversations
2. Review low-confidence predictions
3. Add new training phrases
4. Retrain model regularly
5. A/B test different responses

---

## 🎯 Alternative: Using Pre-built Solutions

Jika ingin lebih cepat, gunakan:

### 1. **Dialogflow (Google)**
- Visual intent builder
- Pre-trained models
- Multi-language support
- Easy integration

### 2. **Rasa**
- Open-source
- More control
- Self-hosted
- Good documentation

### 3. **Botpress**
- Visual flow builder
- No coding needed for basic bots
- Nice UI

---

## ✅ Success Criteria

- ✅ Bot responds in < 2 seconds
- ✅ Intent accuracy > 80%
- ✅ Handles 80% of common questions
- ✅ Graceful fallback for unknown queries
- ✅ Easy to add new intents via admin dashboard
- ✅ Chat history saved for analysis

---

## 📚 Next Steps

1. Start dengan simple intent classification (5-10 intents)
2. Test dengan real users
3. Collect feedback
4. Add more intents iteratively
5. Consider advanced NLP features later (entity extraction, context handling)

Good luck! 🚀
