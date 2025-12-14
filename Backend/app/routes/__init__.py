from flask import Blueprint

def register_routes(app):
    
    #Auth and User
    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from app.routes.user_routes import user_bp
    app.register_blueprint(user_bp)

    #Games:
    from app.routes.pubg_routes import pubg_bp
    app.register_blueprint(pubg_bp, url_prefix='/games/pubg')

    from app.routes.valorant_route import valorant_bp
    app.register_blueprint(valorant_bp)
    
    from app.routes.league_routes import lol_bp
    app.register_blueprint(lol_bp, url_prefix='/api/lol')

    from app.routes.csgo_routes import csgo_bp
    app.register_blueprint(csgo_bp,url_prefix='/games/csgo')

    
    @app.route("/")
    def home():
        return "home"
    
    @app.get("/health")
    def health():
        return {"status": "ok"}