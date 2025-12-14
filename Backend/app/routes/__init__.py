from flask import Blueprint

def register_routes(app):

    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    from app.routes.user_routes import user_bp
    app.register_blueprint(user_bp)

    from app.routes.valorant_route import valorant_bp
    app.register_blueprint(valorant_bp)

    @app.route("/")
    def home():
        return "home"
    
    @app.get("/health")
    def health():
        return {"status": "ok"}