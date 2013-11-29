
#parses 00410880.csv

from pymongo import MongoClient
import csv
import sys

connectionString = "mongodb://localhost:3005/"
client = MongoClient(connectionString)
db = client.ambition

reader = csv.reader(sys.stdin)

for row in reader:
	db.postcodeLookup.update({'datazone': row[0]},
		{'$set': {'simdrank': row[15], 'isdeprived': row[17] == 'yes', 'ruralClassification': row[13]}},
		multi=True)

