abstract class AccountStatus {
  public static readonly AWAITING_VALIDATION = 'AWAITING_VALIDATION'
  public static readonly EMAIL_VALIDATED = 'EMAIL_VALIDATED'

  public static getMessage(status: string): string {
    return status
      .split('_')
      .map((text) =>
        text.substring(0, 1).concat(text.substring(1).toLowerCase()),
      )
      .join(' ')
  }
}

class Account {
  public readonly id?: string
  public readonly name: string
  public readonly email: string
  public readonly phone: string
  public readonly password: string
  public readonly status: string
  public readonly createdAt?: Date
  public readonly updateddAt?: Date

  private constructor({
    id,
    name,
    email,
    phone,
    password,
    status,
    createdAt,
    updateddAt,
  }: Account) {
    this.id = id
    this.name = name
    this.email = email
    this.phone = phone
    this.password = password
    this.status = status
    this.createdAt = createdAt
    this.updateddAt = updateddAt
    Object.freeze(this)
  }

  public static create({
    id,
    name,
    email,
    phone,
    password,
    status,
    createdAt,
    updateddAt,
  }: Account): Account {
    return new Account({
      id,
      name,
      email,
      phone,
      password,
      status,
      createdAt,
      updateddAt,
    })
  }
}

export { Account, AccountStatus }
