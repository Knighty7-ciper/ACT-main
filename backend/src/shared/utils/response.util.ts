export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
}

export class ResponseUtil {
  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
  ): ApiResponse<T> {
    return {
      status: 'success',
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    message: string,
    statusCode: number = 400,
  ): Omit<ApiResponse<null>, 'data'> {
    return {
      status: 'error',
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success',
  ): ApiResponse<{ data: T[]; pagination: { total: number; page: number; limit: number; pages: number } }> {
    return {
      status: 'success',
      statusCode: 200,
      message,
      data: {
        data,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}
