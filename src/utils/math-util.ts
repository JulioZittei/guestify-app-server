abstract class MathUtil {
  public static generateRandomCode(digits: number): string {
    const min = Math.pow(10, digits - 1)
    const max = Math.pow(10, digits) - 1
    const code = Math.floor(Math.random() * (max - min + 1)) + min
    return code.toString()
  }
}

export { MathUtil }
