from flask import jsonify
from typing import Any, Optional

def success_response(data: Any = None, message: str = 'Success', status_code: int = 200):
    """
    Standard success response format
    
    Args:
        data: Response data
        message: Success message
        status_code: HTTP status code
    
    Returns:
        JSON response with standard format
    """
    response = {
        'success': True,
        'message': message
    }
    
    if data is not None:
        response['data'] = data
    
    return jsonify(response), status_code



def error_response(message: str, status_code: int = 400, errors: Optional[dict] = None):
    """
    Standard error response format
    
    Args:
        message: Error message
        status_code: HTTP status code
        errors: Additional error details
    
    Returns:
        JSON response with standard format
    """
    response = {
        'success': False,
        'error': message
    }
    
    if errors:
        response['details'] = errors
    
    return jsonify(response), status_code


