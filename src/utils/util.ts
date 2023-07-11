const not = <T>(object: T): boolean => {
  return !object
}

const equals = <T>(object: T, other: T): boolean => {
  return object === other
}

const notEquals = <T>(object: T, other: T): boolean => {
  return object !== other
}

export { not, equals, notEquals }
