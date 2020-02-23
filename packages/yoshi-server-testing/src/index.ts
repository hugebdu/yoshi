import { isEqual } from 'lodash';
import {
  FunctionArgs,
  FunctionResult,
  UnpackPromise,
  DSL,
  OptionalPromise,
} from 'yoshi-server/types';
import { HttpClient } from 'yoshi-server-client';

type Mock<Result extends FunctionResult, Args extends FunctionArgs> = {
  request: {
    fn: DSL<Result, Args>;
    variables: Args;
  };
  result: () => OptionalPromise<Result>;
};

export default class implements HttpClient {
  private mocks: Array<Mock<any, any>>;

  constructor(mocks: Array<Mock<any, any>> = []) {
    this.mocks = mocks;
  }

  async request<Result extends FunctionResult, Args extends FunctionArgs>(
    dsl: DSL<Result, Args>,
    ...args: Args
  ): Promise<UnpackPromise<Result>> {
    if (!this.mocks.length) {
      throw new Error(
        `\n\n
        A request to ${JSON.stringify(dsl)} was made without supplying a mock.
        Please supply an array of mocks for each request you make.
        `,
      );
    }

    const mock = this.mocks.find(({ request }) => {
      if (request.fn === dsl) {
        return isEqual(args, request.variables);
      }
    });

    if (mock) {
      return mock.result();
    }

    throw new Error(
      `\n\n
      We couldn't find a mock for the following request: ${JSON.stringify(
        dsl,
      )}, with arguments: ${args}.
      The array of mocks is:
      ${JSON.stringify(this.mocks)}
      Please verify that you supplied the correct array of mocks.
      `,
    );
  }
}
