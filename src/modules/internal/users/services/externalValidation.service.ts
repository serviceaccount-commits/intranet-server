import { injectable } from 'inversify';

@injectable()
export class ExternalValidationService {
  async isEmailValid(_email: string): Promise<boolean> {
    return true;
  }

  async isPhoneNumberValid(_phone: string): Promise<boolean> {
    return true;
  }
}
