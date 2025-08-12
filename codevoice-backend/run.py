from flask import Flask
from flask_cors import CORS
from routes import routes_blueprint          # generate-code
from transcribe import transcribe_bp         # your transcription blueprint
from compile_routes import compile_blueprint # compile endpoint

app = Flask(__name__)
CORS(app)

app.register_blueprint(routes_blueprint)
app.register_blueprint(transcribe_bp)
app.register_blueprint(compile_blueprint)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
