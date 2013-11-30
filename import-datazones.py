
#parses the file from http://www.scotland.gov.uk/Topics/Statistics/sns/SNSRef/Postcode-Lookup-2012-1

from pymongo import MongoClient
import csv
import sys

connectionString = "mongodb://localhost:3005/"
client = MongoClient(connectionString)
db = client.ambition

reader = csv.reader(sys.stdin)

for row in reader:
	db.postcodeLookup.update({'postcode': row[0] + row[1]}, {'$set': {'datazone': row[3]}})

