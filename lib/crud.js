/*
Super simple persistance layer.

To use getClient(projectId) you must input the projectId of the current project.

You should also ensure to define the type you expect `value` to be as a typescript class in a long comments, to help the reader of the code.

Exact schema of the objects table:
[
  {
    "column_name": "id",
    "data_type": "bigint",
    "is_nullable": "NO"
  },
  {
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO"
  },
  {
    "column_name": "key",
    "data_type": "text",
    "is_nullable": "NO"
  },
  {
    "column_name": "value",
    "data_type": "jsonb",
    "is_nullable": "YES"
  },
  {
    "column_name": "project_id",
    "data_type": "text",
    "is_nullable": "NO"
  },
]

Example usage:
```js
import { getClient } from 'lib/crud';

class User {
    constructor(name, age) {
        this.name = name
        this.age = age
    }
    }
}

const client = getClient('project-id')

client.set('user:anton_osika', { name: 'Anton Osika', age: 33 })
client.set('user:john_doe', { name: 'John Doe', age: 25 })
client.get('user:anton_osika').then(data => {
    const user = new User(data.name, data.age)
    console.log(user)
})
client.getWithPrefix('user:').then(data => {
    for (const user of data) {
        console.log(user)
    }
})
client.delete('user:anton_osika')
```

*/


// setup, ignore this
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://adlzdmxeyzrvgygumdlq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkbHpkbXhleXpydmd5Z3VtZGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQyNDQ5NzgsImV4cCI6MjAyOTgyMDk3OH0.0vS3BzSD8sQ3mCp2EKGEI24uaNnn4S6b7FzFmranq_Y'

const supabase = createClient(supabaseUrl, supabaseKey)


// pay attention to how the client works:
export const getClient = (projectId) => ({
  get: async (key) => {
    const { data, error} = await (
      supabase
      .from('objects')
      .select('value')
      .eq('project_id', projectId)
      .eq('key', key)
    )

    if (error) {
      console.error(error)
      return null
    }

    return data
  },
  set: async (key, value) => {
    const { error } = await (
      supabase
      .from('objects')
      .upsert({ project_id: projectId, key, value })
    )

    if (error) {
      console.error(error)
      return false
    }

    return true
  },
  delete: async (key) => { const { error } = await (
      supabase
      .from('objects')
      .eq('project_id', projectId)
      .eq('key', key)
      .delete()
    )

    if (error) {
      console.error(error)
      return false
    }

    return true
  },
  getWithPrefix: async (prefix) => {
    const { data, error} = await (
      supabase
      .from('objects') // get both key and value
      .select('key, value')
      .eq('project_id', projectId)
      .like('key', `${prefix}%`)
    )

    if (error) {
      console.error(error)
      return null
    }

    return data
  }
})


