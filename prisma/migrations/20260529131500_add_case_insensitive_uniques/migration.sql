-- Enforce case-insensitive uniqueness for client names and campaign projects per client
CREATE UNIQUE INDEX "Client_name_lower_key" ON "Client"(LOWER("name"));
CREATE UNIQUE INDEX "Campaign_clientId_project_lower_key" ON "Campaign"("clientId", LOWER("project"));
