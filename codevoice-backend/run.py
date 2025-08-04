# run.py
from flask import Flask
from flask_cors import CORS
from routes import routes_blueprint
from transcribe import transcribe_bp
from compile import compile_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(routes_blueprint)
app.register_blueprint(transcribe_bp)
app.register_blueprint(compile_bp)

if __name__ == '__main__':
    app.run(port=5000)
