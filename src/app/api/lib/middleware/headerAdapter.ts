export class HeaderAdapter {
  private raw_request: Request;

  constructor(req: Request) {
    this.raw_request = req;
  }

  getHeader(name: string): string {
    return this.raw_request.headers.get(name) as string;
  }
}
