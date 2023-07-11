import fs from 'fs'
import path from 'path'

abstract class TemplateEmailResolver {
  public static resolve(
    fileName: string,
    replacements: Record<string, string>,
  ): string {
    const templatePath = path.join(
      __dirname,
      `../../public/mail/templates/${fileName}`,
    )
    let template = fs.readFileSync(templatePath, 'utf-8')

    for (const [token, value] of Object.entries(replacements)) {
      const tokenRegex = new RegExp(`{{${token}}}`, 'g')
      template = template.replace(tokenRegex, value)
    }

    return template
  }
}
export { TemplateEmailResolver }
