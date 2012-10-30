import csv
import json

f = open( 'people.csv', 'r' )
people_reader = csv.DictReader( f, fieldnames = ("FIPS", "state", "county", "population", "under_18", "over_65", "no_hs", "hs_only", "college", "female_headed", "black" ))
people_data = json.dumps( [ row for row in people_reader ] )

f = open( 'jobs.csv', 'r' )
jobs_reader = csv.DictReader( f, fieldnames = ("FIPS", "state", "county", "unemployment", "poverty", "poverty_children" ))
jobs_data = json.dumps( [ row for row in jobs_reader ] )


all_people_rows = json.loads(people_data)
all_jobs_rows = json.loads(jobs_data)
out = {}
for r in all_people_rows:
	fips = r["FIPS"]
	del r["FIPS"]
	out[fips] = r

for r in all_jobs_rows:
	fips = r["FIPS"]
	del r["FIPS"]
	if (fips in out):
		out[fips]["unemployment"] = r["unemployment"]
		out[fips]["poverty"] = r["poverty"]
		out[fips]["poverty_children"] = r["poverty_children"]
	else:
		out[fips] = r

print json.dumps(out)
#print json.dumps(out, indent=2)
