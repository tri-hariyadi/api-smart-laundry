set -e

mongo <<EOF
db = db.getSiblingDB('smart_laundry')

db.createUser({
  user: 'admin',
  pwd: '$MONGO_INITDB_ROOT_PASSWORD',
  roles: [{ role: 'readWrite', db: 'smart_laundry' }],
});

db.createCollection('roles');

db.roles.insertMany([
  {
    'code': 1,
    'name': 'Pengusaha Laundry',
    'description': 'User yang memiliki dan menawarkan jasa laundry di smart laundry'
  },
  {
    'code': 2,
    'name': 'Pelanggan Laundry',
    'description': 'User yang menngunakan jasa laundry di smart laundry'
  }
]);

EOF