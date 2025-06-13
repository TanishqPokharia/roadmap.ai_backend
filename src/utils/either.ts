type DataOrError<T> = {
  data: T | null;
  error: Error | null;
};

export default DataOrError;
