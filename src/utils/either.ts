type Either<T> = {
  data: T;
  error: Error | null;
};

export default Either;
