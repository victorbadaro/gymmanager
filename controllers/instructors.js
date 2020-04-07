const fs = require('fs')
const Intl = require('intl')
const data = require('../data.json')
const { age, date } = require('../utils')

exports.index = function(req, res) {
    return res.render('instructors/index', { instructors: data.instructors })
}

// CREATE
exports.create = function(req, res) {
    return res.render('instructors/create')
}

// POST
exports.post = function(req, res) {
    // req.query - funcionaria se fosse uma requisição do tipo get

    // * req.body - para requisições do tipo post
    // {
    //     "avatar_url": "http://www.uol.com.br",
    //     "name": "Herbert Alves",
    //     "birth": "2020-01-30",
    //     "gender": "M",
    //     "services": "Musculação, Crossfit"
    // }

    const keys = Object.keys(req.body)
    // ["avatar_url","name","birth","gender","services"]

    for(key of keys) {
        // req.body.key == ''
        // req.body.avatar_url
        // req.body.name
        // ...
        if (req.body[key] == '')
            return res.send('Please, fill all fields!')
    }

    let { avatar_url, birth, name, services, gender } = req.body

    birth = Date.parse(birth)
    const created_at = Date.now()
    const id = Number(data.instructors.length + 1)

    data.instructors.push({
        id,
        avatar_url,
        name,
        birth,
        gender,
        services,
        created_at
    })

    fs.writeFile('data.json', JSON.stringify(data, null, 2), function(err) {
        if (err)
            return res.send('Write file error!')
        
        return res.redirect('instructors')
    })

    // return res.send(req.body);
}

// SHOW
exports.show = function(req, res) {
    // req.query.id =>
            // por exemplo http://url.com?id=1

    // req.body.id =>
            // pega os dados (através do atributo name dos elementos) de um formulário quando a requisição é do tipo POST

    // req.params.id =>
            // por exemplo http://url.com/1

    const { id } = req.params

    const foundInstructor = data.instructors.find(function(instructor) {
        return instructor.id == id
    })

    if (!foundInstructor)
        return res.send('Instructor not found!')

    const instructor = {
        ...foundInstructor,
        age: age(foundInstructor.birth),
        services: foundInstructor.services.split(','),
        created_at: new Intl.DateTimeFormat('pt-BR').format(foundInstructor.created_at)
    }

    return res.render('instructors/show', { instructor })
}

// EDIT
exports.edit = function(req, res) {
    const { id } = req.params

    const foundInstructor = data.instructors.find(function(instructor) {
        return instructor.id == id
    })

    if (!foundInstructor)
        return res.send('Instructor not found!')

    const instructor = {
        ...foundInstructor,
        birth: date(foundInstructor.birth).iso
    }

    return res.render('instructors/edit', { instructor })
}

// PUT
exports.put = function(req, res) {
    const { id } = req.body
    let index = 0

    const foundInstructor = data.instructors.find(function(instructor, foundIndex) {
        if (id == instructor.id) {
            index = foundIndex
            return true
        }
    })

    if (!foundInstructor)
        return res.send('Instructor not found!')

    const instructor = {
        ...foundInstructor,
        ...req.body,
        id: Number(req.body.id),
        birth: Date.parse(req.body.birth)
    }

    data.instructors[index] = instructor

    fs.writeFile('data.json', JSON.stringify(data, null, 2), function(err) {
        if (err)
            return res.send('Write error!')
        
        return res.redirect(`/instructors/${id}`)
    })
}

// DELETE
exports.delete = function (req, res) {
    const { id } = req.body

    const filteredInstructors = data.instructors.filter(function(instructor) {
        return instructor.id != id
    })

    data.instructors = filteredInstructors

    fs.writeFile('data.json', JSON.stringify(data, null, 2), function(err) {
        if (err)
            return res.send('Write file error!')

        return res.redirect('/instructors')
    })
}