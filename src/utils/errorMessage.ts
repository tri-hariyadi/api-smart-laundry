type ErrorWithMessage = {
  message: string
}

class ErrorMessage {
  private isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as Record<string, unknown>).message === 'string'
    );
  }

  private toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (this.isErrorWithMessage(maybeError)) return maybeError;

    try {
      return new Error(JSON.stringify(maybeError));
    } catch {
      // fallback in case there's an error stringifying the maybeError
      // like with circular references for example.
      return new Error(String(maybeError));
    }
  }

  public getErrorMessage(error: unknown) {
    return this.toErrorWithMessage(error).message;
  }
}

export default new ErrorMessage();
