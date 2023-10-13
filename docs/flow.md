1. Once the application has been started, create a staff user (if he doesn't already exist).

To do that, login to the mysql server, select the secure_medic database, and run the following query:

```sql
INSERT INTO user (id, createdOn, updatedOn, voidedOn, givenName, familyName, email, password, role, organizationId)
VALUES ('018aa4b9-d398-75d7-bfd6-68dccea4b7a6', '2023-09-18 00:00:00', '2023-09-18 00:00:00', NULL, 'STAFF', NULL, 'staff@securemedic.com', '$2a$10$7VfGDxQccW7LjSKoSwJow.VQE5E.ubHXsN2MZB.0OP9.KJON5yL1C', 'Staff', NULL);
```

2. Next, you log-in using the below credentials on Postman

```
Email: staff@securemedic.com
Password: $ecur3M3d!cSt@ff
```

2. Once that is done, you hit the generate 2fa endpoint and get a 2fa qr code

3. Next, hit the enable 2fa endpoint and pass the 2fa code from your authenticator app in the request body.
   This is a one-time process to enable 2fa on the account

4. Now, every-time you log-in, you need to hit /log-in first, then /authenticate next with 2fa code to fully authenticate yourself.

npm install -g yarn && yarn && yarn build
yarn start:prod
