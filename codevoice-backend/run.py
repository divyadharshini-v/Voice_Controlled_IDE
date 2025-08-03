from flask import Flask
from flask_cors import CORS
from routes import routes_blueprint
from generate_code import generate_code_bp
from transcribe import transcribe_bp

app = Flask(__name__)
CORS(app)

# Registering all route blueprints
app.register_blueprint(routes_blueprint)
app.register_blueprint(generate_code_bp)
app.register_blueprint(transcribe_bp)

if __name__ == '__main__':
    app.run(port=5000)
