class ApiResponse {
  constructor(success, data, message = null, statusCode = 200) {
    this.success = success;
    if (data) this.data = data;
    if (message) this.message = message;
  }

  static success(data, message = null, statusCode = 200) {
    return new ApiResponse(true, data, message, statusCode);
  }

  static error(message, statusCode = 400, errors = null) {
    const response = new ApiResponse(false, null, message, statusCode);
    if (errors) response.errors = errors;
    return response;
  }

  static paginated(data, page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}

export default ApiResponse;
