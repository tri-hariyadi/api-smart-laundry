interface DataStoredInToken {
  expiresIn: string | number;
  issuer: string;
  audience: string;
  id: string;
}

export default DataStoredInToken;
