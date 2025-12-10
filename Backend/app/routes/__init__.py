from flask import Blueprint

def register_routes(app):

    from app.routes.auth_routes import auth_bp


    app.register_blueprint(auth_bp, url_prefix='/auth')


    @app.route("/")
    def home():
        return "home"