export default class Response {
  static successResponseSimple(success: boolean, data: object) {
    return {
      success,
      data,
    }
  }
  static errorResponseSimple(success: boolean, errors: object) {
    
    return {
      success,
      errors,
    }
  }
}
