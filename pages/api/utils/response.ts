export const errorResponse = (res: any, error: any) => {
    return res.status(500).json({
        success: false,
        message: error.message,
        error: error,
    });
}

export const successResponse = (res: any, data: any) => {
    return res.status(200).json({
        success: true,
        data: data,
    });
}