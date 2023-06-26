class Err<E, R> {
  public readonly value: E

  constructor(value: E) {
    this.value = value
  }

  public isError(): this is Err<E, R> {
    return true
  }

  public isResult(): this is Res<E, R> {
    return false
  }
}

class Res<E, R> {
  public readonly value: R

  constructor(value: R) {
    this.value = value
  }

  public isError(): this is Err<E, R> {
    return false
  }

  public isResult(): this is Res<E, R> {
    return true
  }
}

type Either<E, R> = Err<E, R> | Res<E, R>

const error = <E, R>(e: E): Either<E, R> => {
  return new Err<E, R>(e)
}

const result = <E, R>(r: R): Either<E, R> => {
  return new Res<E, R>(r)
}

export { Either, Err, Res, error, result }
