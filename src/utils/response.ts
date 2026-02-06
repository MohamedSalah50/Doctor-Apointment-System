import { IResponse } from 'src/common';

export const successResponse = <T = any>({
  data,
  message = 'done',
  status = 200,
}: IResponse<T> = {}): IResponse<T> => {
  return { message, data, status };
};
