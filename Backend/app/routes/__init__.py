from flask import Blueprint

def register_routes(app):
    
    from app.routes.auth_routes import auth_bp
    from app.routes.pubg_routes import pubg_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    # from app.routes.auth_routes import auth_bp
    from app.routes.pubg_routes import pubg_bp


    # app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(pubg_bp, url_prefix='/games/pubg')


    @app.route("/")
    def home():
        return "home"
    
    from app.routes.league_routes import lol_bp
    app.register_blueprint(lol_bp, url_prefix='/api/lol')
    
    from app.routes.user_routes import user_bp
    app.register_blueprint(user_bp)
