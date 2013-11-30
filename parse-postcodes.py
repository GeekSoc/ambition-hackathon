
#parses ofcom-part1-fixed-broadband-postcode-level-data-2013.csv and ofcom-part2-fixed-broadband-postcode-level-data-2013.csv

from pymongo import MongoClient
import csv
import sys

connectionString = "mongodb://localhost:3005/"
client = MongoClient(connectionString)
db = client.ambition

reader = csv.reader(sys.stdin)

for row in reader:
	db.postcodeLookup.save({'postcode': row[0], 'internet': row[2] == "Y"})
