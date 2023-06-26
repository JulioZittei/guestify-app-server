import { Service } from 'fastify-decorators'

export function Repository(injectableToken: string | symbol): ClassDecorator {
  return (target) => {
    Service(injectableToken)(target)
  }
}
