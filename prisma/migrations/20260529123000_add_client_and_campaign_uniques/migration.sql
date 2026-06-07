-- Enforce client and campaign uniqueness at database level
CREATE UNIQUE INDEX "Client_name_key" ON "Client"("name");
CREATE UNIQUE INDEX "Campaign_clientId_project_key" ON "Campaign"("clientId", "project");
