import { Session } from "../types/Session.js";
import { Person } from "../types/user/Person.js";

interface IData {
  persons: Map<string, Person>;
  sessions: Map<string, Session>;
}

export default class DataBase {
  data: IData;
  path: string;
  minified: boolean;
  constructor(path: string, minified = false) {
    this.data = { persons: new Map, sessions: new Map};
    this.path = path;
    this.minified = minified;
    this.load();
  }
  load() {
    // todo
  }
  save() {
    // todo
  }
}