json.arrivals @transit_data.map do |arrival|
    json.time arrival[:time]
    json.status arrival[:status]
    json.route arrival[:route]
end
