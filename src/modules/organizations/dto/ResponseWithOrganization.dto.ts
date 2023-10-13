import { Organization } from '../entities/organization.entity';

export class ResponseWithOrganization {
  id: string;
  name: string;
  domain: string;
  description: string;

  constructor(organizaton: Organization) {
    this.id = organizaton.id;
    this.name = organizaton.name;
    this.domain = organizaton.domain;
    this.description = organizaton.description;
  }
}
