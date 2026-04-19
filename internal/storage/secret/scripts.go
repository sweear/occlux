package secretStorage

import "github.com/redis/go-redis/v9"

var saveScript = redis.NewScript(`
    redis.call('HSET', KEYS[1], 
        'data',      ARGV[1],
        'maxViews',  ARGV[2],
        'viewCount', ARGV[3]
    )
    redis.call('EXPIRE', KEYS[1], ARGV[4])
    return 1
`)

var getAndDecrementScript = redis.NewScript(`
    local key = KEYS[1]
    
    local exists = redis.call('EXISTS', key)
    if exists == 0 then
        return nil
    end
    
    local viewCount = redis.call('HINCRBY', key, 'viewCount', 1)
    local maxViews  = tonumber(redis.call('HGET', key, 'maxViews'))
    
    local data = redis.call('HGET', key, 'data')
    
    if viewCount >= maxViews then
        redis.call('DEL', key)
    end
    
    return data
`)
