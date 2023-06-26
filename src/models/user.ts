class User {
  public readonly id?: string
  public readonly name: string
  public readonly email: string
  public readonly phone: string
  public readonly password: string
  public readonly createdAt?: Date
  public readonly updateddAt?: Date

  private constructor({
    id,
    name,
    email,
    phone,
    password,
    createdAt,
    updateddAt,
  }: User) {
    this.id = id
    this.name = name
    this.email = email
    this.phone = phone
    this.password = password
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
    createdAt,
    updateddAt,
  }: User): User {
    return new User({ id, name, email, phone, password, createdAt, updateddAt })
  }
}

export { User }
