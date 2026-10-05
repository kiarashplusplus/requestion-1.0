-- Dev seed: 8 weeks of EIA-style weekly prices for US, PADD3, TX and Houston (regular + diesel), one macro series, one published post.
INSERT OR IGNORE INTO feed VALUES ('us-eia-weekly','EIA Weekly Retail Gasoline and Diesel Prices','US','region','daily','https://www.eia.gov/petroleum/gasdiesel/','U.S. Government work (public domain)','https://www.eia.gov/about/copyrights_reuse.php','Source: U.S. Energy Information Administration (EIA)',1,1,1);

INSERT OR IGNORE INTO region (code,country,name,kind,parent_code,tz,slug,dateline) VALUES
 ('US','US','United States','country',NULL,'America/New_York','us','WASHINGTON'),
 ('US-PADD3','US','Gulf Coast (PADD 3)','padd','US','America/Chicago','us/gulf-coast',NULL),
 ('US-TX','US','Texas','state','US-PADD3','America/Chicago','us/tx','AUSTIN, Texas'),
 ('US-TX-HOUSTON','US','Houston','metro','US-TX','America/Chicago','us/tx/houston','HOUSTON');

-- Weekly Monday observations, most recent first is 2026-09-28.
INSERT OR IGNORE INTO price_observation (feed_id,country,region_code,fuel,unit,currency,price,observed_at,periodicity,ingested_at) VALUES
 ('us-eia-weekly','US','US','gasoline_regular','gal','USD',4.41,'2026-09-28T00:00:00Z','weekly','2026-09-29T09:00:00Z'),
 ('us-eia-weekly','US','US','gasoline_regular','gal','USD',4.48,'2026-09-21T00:00:00Z','weekly','2026-09-22T09:00:00Z'),
 ('us-eia-weekly','US','US','gasoline_regular','gal','USD',4.32,'2026-09-14T00:00:00Z','weekly','2026-09-15T09:00:00Z'),
 ('us-eia-weekly','US','US','gasoline_regular','gal','USD',4.19,'2026-09-07T00:00:00Z','weekly','2026-09-08T09:00:00Z'),
 ('us-eia-weekly','US','US','gasoline_regular','gal','USD',4.12,'2026-08-31T00:00:00Z','weekly','2026-09-01T09:00:00Z'),
 ('us-eia-weekly','US','US','gasoline_regular','gal','USD',4.05,'2026-08-24T00:00:00Z','weekly','2026-08-25T09:00:00Z'),
 ('us-eia-weekly','US','US','gasoline_regular','gal','USD',4.01,'2026-08-17T00:00:00Z','weekly','2026-08-18T09:00:00Z'),
 ('us-eia-weekly','US','US','gasoline_regular','gal','USD',3.98,'2026-08-10T00:00:00Z','weekly','2026-08-11T09:00:00Z'),
 ('us-eia-weekly','US','US-PADD3','gasoline_regular','gal','USD',3.96,'2026-09-28T00:00:00Z','weekly','2026-09-29T09:00:00Z'),
 ('us-eia-weekly','US','US-PADD3','gasoline_regular','gal','USD',4.02,'2026-09-21T00:00:00Z','weekly','2026-09-22T09:00:00Z'),
 ('us-eia-weekly','US','US-PADD3','gasoline_regular','gal','USD',3.89,'2026-09-14T00:00:00Z','weekly','2026-09-15T09:00:00Z'),
 ('us-eia-weekly','US','US-PADD3','gasoline_regular','gal','USD',3.77,'2026-09-07T00:00:00Z','weekly','2026-09-08T09:00:00Z'),
 ('us-eia-weekly','US','US-TX','gasoline_regular','gal','USD',3.91,'2026-09-28T00:00:00Z','weekly','2026-09-29T09:00:00Z'),
 ('us-eia-weekly','US','US-TX','gasoline_regular','gal','USD',3.98,'2026-09-21T00:00:00Z','weekly','2026-09-22T09:00:00Z'),
 ('us-eia-weekly','US','US-TX','gasoline_regular','gal','USD',3.84,'2026-09-14T00:00:00Z','weekly','2026-09-15T09:00:00Z'),
 ('us-eia-weekly','US','US-TX','gasoline_regular','gal','USD',3.72,'2026-09-07T00:00:00Z','weekly','2026-09-08T09:00:00Z'),
 ('us-eia-weekly','US','US-TX','gasoline_regular','gal','USD',3.66,'2026-08-31T00:00:00Z','weekly','2026-09-01T09:00:00Z'),
 ('us-eia-weekly','US','US-TX','gasoline_regular','gal','USD',3.61,'2026-08-24T00:00:00Z','weekly','2026-08-25T09:00:00Z'),
 ('us-eia-weekly','US','US-TX-HOUSTON','gasoline_regular','gal','USD',3.88,'2026-09-28T00:00:00Z','weekly','2026-09-29T09:00:00Z'),
 ('us-eia-weekly','US','US-TX-HOUSTON','gasoline_regular','gal','USD',3.95,'2026-09-21T00:00:00Z','weekly','2026-09-22T09:00:00Z'),
 ('us-eia-weekly','US','US-TX-HOUSTON','gasoline_regular','gal','USD',3.80,'2026-09-14T00:00:00Z','weekly','2026-09-15T09:00:00Z'),
 ('us-eia-weekly','US','US-TX-HOUSTON','gasoline_regular','gal','USD',3.69,'2026-09-07T00:00:00Z','weekly','2026-09-08T09:00:00Z'),
 ('us-eia-weekly','US','US-TX-HOUSTON','gasoline_regular','gal','USD',3.63,'2026-08-31T00:00:00Z','weekly','2026-09-01T09:00:00Z'),
 ('us-eia-weekly','US','US','diesel','gal','USD',4.89,'2026-09-28T00:00:00Z','weekly','2026-09-29T09:00:00Z'),
 ('us-eia-weekly','US','US','diesel','gal','USD',4.93,'2026-09-21T00:00:00Z','weekly','2026-09-22T09:00:00Z'),
 ('us-eia-weekly','US','US-TX','diesel','gal','USD',4.41,'2026-09-28T00:00:00Z','weekly','2026-09-29T09:00:00Z'),
 ('us-eia-weekly','US','US-TX','diesel','gal','USD',4.46,'2026-09-21T00:00:00Z','weekly','2026-09-22T09:00:00Z');

INSERT OR IGNORE INTO macro_series VALUES ('bls:CUUR0000SETB01','US',NULL,'cpi_gasoline_yoy','U.S. Bureau of Labor Statistics','https://www.bls.gov/cpi/','Public domain; BLS.gov cannot vouch for the data or analyses derived from these data after retrieval');
INSERT OR IGNORE INTO macro_series VALUES ('bls:CUUR0000SA0','US',NULL,'cpi_all_yoy','U.S. Bureau of Labor Statistics','https://www.bls.gov/cpi/','Public domain; BLS.gov cannot vouch for the data or analyses derived from these data after retrieval');
INSERT OR IGNORE INTO macro_observation VALUES ('bls:CUUR0000SETB01','2026-08',27.4,'pct','2026-09-11T12:30:00Z');
INSERT OR IGNORE INTO macro_observation VALUES ('bls:CUUR0000SA0','2026-08',3.4,'pct','2026-09-11T12:30:00Z');

INSERT OR IGNORE INTO feed_run VALUES ('seed-run-1','us-eia-weekly','2026-09-29T09:00:00Z','2026-09-29T09:00:20Z','ok',27,'raw/us-eia-weekly/2026/09/29/seed-run-1.json',NULL);
