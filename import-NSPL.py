
#parses NSPL_NOV_2013_UK.csv

from pymongo import MongoClient
import csv
import sys

connectionString = "mongodb://130.159.141.91:27017/"
client = MongoClient(connectionString)
db = client.ambition

reader = csv.reader(sys.stdin)

for row in reader:
	db.nspl.save({'postcode': row[0], 'oseast': row[6], 'osnorth': row[7], 'gridQuality': row[8], 'localAuthMash': row[11], 'country': row[15], 'travelTWork': row[20], 'lowerLayerSOA': row[25], 'workplaceZone': row[26], 'ruralityMash': row[30]})

